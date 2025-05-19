"use server";

import axios from "axios";
import { db } from "@/prisma/db";
import { UserProps } from "@/types/types";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
export async function createUser(data: UserProps) {
  const { email, password, firstName, lastName,
     name, phone, image,role, country,location} = data;

  try {
    // Hash the password and handle potential errors
    const hashedPassword = await bcrypt.hash(password, 10).catch((err) => {
      console.error('Error hashing password:', err);
      throw new Error('Password hashing failed');
    });

    // Check if the user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: 'Email already exists',
        status: 409,
        data: null,
      };
    }

    // Create new user in the database
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name,
        phone,
        image,
        role,
        country,
        location,
      },
    });
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/users');
    console.log(newUser);

    // Return success if the user is created
    return {
      error: null,
      status: 200,
      data: newUser,
    };

  } catch (error: any) {
    // Handle specific database-related errors (e.g., Prisma errors)
    if (error.code === 'P2002') {
      // P2002 is Prisma's unique constraint violation code
      return {
        error: 'Email already exists',
        status: 409,
        data: null,
      };
    }

    // Log the error with more context and handle other generic errors
    console.error('Create user error:', error);

    return {
      error: 'Something went wrong, please try again later',
      status: 500,
      data: null,
    };
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await db.user.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedUser,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateClientById(id: string, data: UserProps) {
  try {
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/clients");
    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getKitUsers() {
  const endpoint = process.env.KIT_API_ENDPOINT as string;
  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 0 }, // Revalidate immediately
    });
    const response = await res.json();
    const count = response.count;
    console.log(count);
    return count;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
