import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Care+ Medical API",
      version: "1.0.0",
      description: "Healthcare Management System REST API",
      contact: {
        name: "API Support",
        email: "support@careplus.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://medical-backend-54hp.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            phone: { type: "string" },
            address: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            specialty_id: { type: "integer" },
            specialty_name: { type: "string" },
            experience_years: { type: "integer" },
            consultation_price: { type: "number" },
            rating: { type: "number" },
            description: { type: "string" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            patient_id: { type: "integer" },
            doctor_id: { type: "integer" },
            appointment_date: { type: "string", format: "date" },
            appointment_time: { type: "string", format: "time" },
            status: {
              type: "string",
              enum: ["scheduled", "completed", "cancelled"],
            },
            notes: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
