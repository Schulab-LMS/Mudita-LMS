"use server";

import { db } from "@/lib/db";
import type { AgeGroup } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "@/validators/action.schemas";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(data: {
  name: string;
  nameAr?: string;
  nameDe?: string;
  slug?: string;
  description: string;
  descriptionAr?: string;
  descriptionDe?: string;
  price: number;
  ageGroup: string;
  category: string;
  stock: number;
  status: string;
}) {
  try {
    await requireAdmin();
    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const slug = data.slug?.trim() || slugify(parsed.data.name);

    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A product with this slug already exists" };
    }

    const product = await db.product.create({
      data: {
        name: parsed.data.name,
        nameAr: data.nameAr || null,
        nameDe: data.nameDe || null,
        slug,
        description: parsed.data.description,
        descriptionAr: data.descriptionAr || null,
        descriptionDe: data.descriptionDe || null,
        price: parsed.data.price,
        ageGroup: parsed.data.ageGroup as AgeGroup,
        category: parsed.data.category,
        stock: parsed.data.stock,
        status: parsed.data.status as "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED",
      },
    });

    revalidatePath("/admin/products");
    return { success: true, productId: product.id };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  productId: string,
  data: {
    name: string;
    nameAr?: string;
    nameDe?: string;
    slug?: string;
    description: string;
    descriptionAr?: string;
    descriptionDe?: string;
    price: number;
    ageGroup: string;
    category: string;
    stock: number;
    status: string;
  }
) {
  try {
    await requireAdmin();
    const parsed = updateProductSchema.safeParse({ productId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const slug = data.slug?.trim() || slugify(parsed.data.data.name);

    const existing = await db.product.findUnique({ where: { slug } });
    if (existing && existing.id !== parsed.data.productId) {
      return { success: false, error: "A product with this slug already exists" };
    }

    await db.product.update({
      where: { id: parsed.data.productId },
      data: {
        name: parsed.data.data.name,
        nameAr: data.nameAr || null,
        nameDe: data.nameDe || null,
        slug,
        description: parsed.data.data.description,
        descriptionAr: data.descriptionAr || null,
        descriptionDe: data.descriptionDe || null,
        price: parsed.data.data.price,
        ageGroup: parsed.data.data.ageGroup as AgeGroup,
        category: parsed.data.data.category,
        stock: parsed.data.data.stock,
        status: parsed.data.data.status as "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED",
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdmin();
    const parsed = deleteProductSchema.safeParse({ productId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.product.delete({ where: { id: parsed.data.productId } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
