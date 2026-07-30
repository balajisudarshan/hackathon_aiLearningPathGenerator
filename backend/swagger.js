import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Learning Path Generator API",
      version: "1.0.0",
      description: "API for AI-driven personalized learning paths, quizzes, chat, and progress tracking.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.routes.js", "./routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
