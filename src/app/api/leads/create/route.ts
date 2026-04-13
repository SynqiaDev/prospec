import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { leads, projects } from "@/db/schema";
import { parseBrazilAddress } from "@/lib/address-parser";
import { LEAD_SOURCE_VALUES } from "@/lib/lead-source";

const leadSourceSchema = z.enum(LEAD_SOURCE_VALUES);

const createLeadSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório"),
    lead_source: leadSourceSchema.optional(),
    leadSource: leadSourceSchema.optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    whatsapp_number: z.string().trim().optional(),
    website_url: z.string().trim().optional(),
    google_rating: z.number().min(0).max(5).optional(),
    google_review_count: z.number().int().min(0).optional(),
    observations: z.string().trim().optional(),
    contact_status: z.string().default("pending"),
    contact_date: z.coerce.date().optional().nullable(),
    conversion_status: z.string().default("not_converted"),
    conversion_date: z.coerce.date().optional().nullable(),
    project_id: z.string().uuid("project_id deve ser um UUID válido"),
  })
  .transform(({ lead_source, leadSource, ...rest }) => ({
    ...rest,
    lead_source: lead_source ?? leadSource ?? "manual",
  }));

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };

  return NextResponse.json(body, { status });
}

function extractBearerToken(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }

  const [scheme, token, extra] = authHeader.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token || extra) {
    return null;
  }

  return token;
}

export async function POST(request: Request) {
  const expectedApiKey = process.env.LEADS_API_KEY;
  if (!expectedApiKey) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Configuração interna de autenticação indisponível.",
    );
  }

  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token || token !== expectedApiKey) {
    return errorResponse(
      401,
      "UNAUTHORIZED",
      "Header Authorization inválido. Use o formato 'Bearer <API_KEY>'.",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "O corpo da requisição deve ser um JSON válido.");
  }

  const validation = createLeadSchema.safeParse(payload);
  if (!validation.success) {
    return errorResponse(422, "VALIDATION_ERROR", "Payload inválido.", validation.error.flatten());
  }

  const parsedLead = validation.data;
  const parsedAddress = parseBrazilAddress(parsedLead.address);

  try {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, parsedLead.project_id))
      .limit(1);

    if (!project) {
      return errorResponse(
        422,
        "PROJECT_NOT_FOUND",
        "Não existe projeto para o project_id informado.",
      );
    }

    const [existingLead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(eq(leads.name, parsedLead.name), eq(leads.project_id, parsedLead.project_id)))
      .limit(1);

    if (existingLead) {
      return errorResponse(
        409,
        "DUPLICATE_LEAD",
        "Já existe um lead com este nome para o projeto informado.",
      );
    }

    const [createdLead] = await db
      .insert(leads)
      .values({
        ...parsedLead,
        city: parsedAddress.city,
        state: parsedAddress.state,
        contact_date: parsedLead.contact_date ?? null,
        conversion_date: parsedLead.conversion_date ?? null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: createdLead,
      },
      { status: 201 },
    );
  } catch {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Falha inesperada ao criar o lead.",
    );
  }
}
