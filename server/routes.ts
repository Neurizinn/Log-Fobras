import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVehicleSchema, insertMaterialSchema, insertOperationSchema, insertLogSchema } from "@shared/schema";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import axios from "axios";
import jwt from "jsonwebtoken";
import { logger, createRequestLogger, getRequestInfo } from "./logger";
import { nanoid } from "nanoid";

const clientId = "0cd62e78-c77c-40b9-9956-b0ec588a3149"
const tenantId = "7f6df389-4d9f-4f42-9469-440704f55abe"

const secret = "5iT8Q~eQPfMI92.~KzD1EEtiy1Pqk4xkf.FnqaLe"

const PgSession = ConnectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Request logging middleware
  app.use((req: any, res, next) => {
    const requestId = nanoid(10);
    const startTime = Date.now();
    req.requestId = requestId;
    req.logger = createRequestLogger(requestId);
    
    const requestInfo = getRequestInfo(req);
    
    // Log incoming request
    req.logger.info(`Incoming ${req.method} ${req.path}`, {
      ...requestInfo,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress
      }
    });

    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function(body: any) {
      const duration = Date.now() - startTime;
      req.logger.logRequest(req.method, req.path, res.statusCode, duration, {
        ...requestInfo,
        details: {
          requestId,
          responseBody: typeof body === 'object' ? Object.keys(body) : typeof body
        }
      });
      return originalJson.call(this, body);
    };

    next();
  });

  // Global error handler middleware
  app.use((err: any, req: any, res: any, next: any) => {
    const requestInfo = getRequestInfo(req);
    req.logger?.logError(err, {
      ...requestInfo,
      details: {
        path: req.path,
        method: req.method,
        requestId: req.requestId
      }
    });
    next(err);
  });

  // Session configuration
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Callback do Microsoft Login
  app.get("/auth/callback", async (req: any, res: any) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Authorization code missing");
    try {
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: clientId,
          scope: "openid profile email",
          code: code,
          redirect_uri: "http://localhost:5000/auth/callback",
          grant_type: "authorization_code",
          client_secret: secret,
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const idToken = tokenResponse.data.id_token;

      // Decodificar o JWT
      const decoded: any = jwt.decode(idToken);

      const { email, name } = decoded

      // Validar domínio do email
      const allowedDomain = "fobras.com.br";
      if (!email.endsWith(`@${allowedDomain}`)) {
        return res.status(403).json({ message: "Acesso negado. Email deve pertencer ao domínio da empresa." });
      }

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        user = await storage.createUser({
          email,
          name,
          role: "viewer",
          permissions: ["dashboard:view"],
        });

      }

      // Criar sessão do usuário
      req.session.user = user

      // Redirecionar para a página principal
      res.redirect("/");
    } catch (err) {
      console.error("ERRO AQUI TESTE:" + JSON.stringify(err));
      res.status(500).send("Erro ao trocar código por token");
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      // Check if email belongs to company domain (this would be configured)
      const allowedDomain = process.env.COMPANY_DOMAIN || "empresa.com";
      if (!email.endsWith(`@${allowedDomain}`)) {
        return res.status(403).json({ message: "Acesso negado. Email deve pertencer ao domínio da empresa." });
      }

      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          name,
          role: "viewer",
          permissions: ["dashboard:view"],
        });
      }

      req.session.user = user;
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", (req: any, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar veículos" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para cadastro de veículo" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, vehicleData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar veículo" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicle(id);
      res.json({ message: "Veículo excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir veículo" });
    }
  });

  // Material routes
  app.get("/api/materials", requireAuth, async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar materiais" });
    }
  });

  app.post("/api/materials", requireAuth, async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para cadastro de material" });
    }
  });

  app.put("/api/materials/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const materialData = insertMaterialSchema.partial().parse(req.body);
      const material = await storage.updateMaterial(id, materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar material" });
    }
  });

  app.delete("/api/materials/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaterial(id);
      res.json({ message: "Material excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir material" });
    }
  });

  // Operation routes
  app.get("/api/operations", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      let operations;
      
      if (status) {
        operations = await storage.getOperationsByStatus(status as string);
      } else {
        operations = await storage.getOperations();
      }
      
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar operações" });
    }
  });

  app.post("/api/operations", requireAuth, async (req, res) => {
    try {
      const operationData = insertOperationSchema.parse(req.body);
      const operation = await storage.createOperation(operationData);
      req.logger?.info(`Operation created: ${operation.id}`, getRequestInfo(req));
      res.json(operation);
    } catch (error) {
      req.logger?.logError(error as Error, getRequestInfo(req));
      if (error instanceof Error && error.message.includes('Expected')) {
        // Erro de validação Zod - retorna detalhes específicos
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Dados inválidos para criação de operação" });
      }
    }
  });

  app.put("/api/operations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const operationData = insertOperationSchema.partial().parse(req.body);
      const operation = await storage.updateOperation(id, operationData);
      res.json(operation);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar operação" });
    }
  });

  app.delete("/api/operations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOperation(id);
      res.json({ message: "Operação excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir operação" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // All Users
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUsers();
      console.log(user)
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar permissões" });
    }
  });

  // All Users
  app.get("/api/users/:id/permissions", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      return user?.permissions || undefined;
    } catch (error) {
      res.status(400).json({ message: "Erro ao buscar permissões" });
    }
  });

  // User permissions
  app.put("/api/users/:id/permissions", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const user = await storage.updateUserPermissions(id, permissions);
      
      // Se as permissões atualizadas são do usuário logado, atualizar a sessão
      if (req.session.user && req.session.user.id === id) {
        req.session.user = { ...req.session.user, permissions };
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar permissões" });
    }
  });

  // Logs routes
  app.get("/api/logs", requireAuth, async (req: any, res) => {
    try {
      const { limit, level, source } = req.query;
      const logs = await storage.getLogs(
        limit ? parseInt(limit as string) : undefined,
        level as string,
        source as string
      );
      res.json(logs);
    } catch (error) {
      req.logger?.logError(error as Error, getRequestInfo(req));
      res.status(500).json({ message: "Erro ao buscar logs" });
    }
  });

  // Client log endpoint
  app.post("/api/logs/client", async (req: any, res) => {
    try {
      const { level, message, details, stackTrace } = req.body;
      const requestInfo = getRequestInfo(req);
      
      await req.logger?.clientLog(level, message, {
        ...requestInfo,
        details: details ? JSON.parse(details) : undefined,
        stackTrace
      });
      
      res.json({ success: true });
    } catch (error) {
      req.logger?.logError(error as Error, getRequestInfo(req));
      res.status(500).json({ message: "Erro ao salvar log do cliente" });
    }
  });

  // Clean old logs (maintenance endpoint)
  app.delete("/api/logs/cleanup", requireAuth, async (req: any, res) => {
    try {
      const { days = 30 } = req.query;
      await storage.deleteOldLogs(parseInt(days as string));
      req.logger?.info(`Cleaned logs older than ${days} days`, getRequestInfo(req));
      res.json({ message: `Logs mais antigos que ${days} dias foram removidos` });
    } catch (error) {
      req.logger?.logError(error as Error, getRequestInfo(req));
      res.status(500).json({ message: "Erro ao limpar logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
