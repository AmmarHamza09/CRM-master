"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { generateSlug } from "@/lib/generateSlug";
import toast from "react-hot-toast";
import { UserProps } from "@/types/types";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";

import { createUser, updateClientById } from "@/actions/users";
import PasswordInput from "../FormInputs/PasswordInput";
import { Headset, Mail, User, Lock, MapPinned } from "lucide-react";

type ClientFormProps = {
  editingId?: string;
  initialData?: UserProps | null;
};

export default function ClientForm({
  editingId,
  initialData,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProps>({
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      country: initialData?.country || "",
      location: initialData?.location || "",
      image: initialData?.image || "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png");

  async function onSubmit(data: UserProps) {
    setLoading(true);
    try {
      const formData = {
        ...data,
        name: `${data.firstName} ${data.lastName}`,
        image: imageUrl,
        role: "CLIENT" as const,
      };

      if (editingId) {
        const res = await updateClientById(editingId, formData);
        if (res) {
          toast.success("Client updated successfully");
          router.push("/dashboard/clients");
        } else {
          toast.error("Failed to update client");
        }
      } else {
        const res = await createUser(formData);
        if (res.status === 409) {
          setEmailErr(res.error);
        } else if (res.status === 200) {
          toast.success("Client created successfully");
          router.push("/dashboard/clients");
        } else {
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FormHeader
        href="/dashboard/clients"
        parent="Clients"
        title={editingId ? "Update Client" : "New Client"}
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 col-span-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the client's details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="First Name"
                  name="firstName"
                  icon={User}
                  placeholder="First Name"
                  required
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  placeholder="Last Name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  name="phone"
                  icon={Headset}
                  placeholder="Phone Number"
                  required
                />
                <div>
                  <TextInput
                    type="email"
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                    icon={Mail}
                    placeholder="Email"
                    required
                  />
                  {emailErr && (
                    <p className="text-red-500 text-sm mt-1">{emailErr}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Country"
                  name="country"
                  icon={User}
                  placeholder="Country"
                  required
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Location"
                  name="location"
                  icon={MapPinned}
                  placeholder="Location"
                  required
                />
              </div>

              {!editingId && (
                <PasswordInput
                  register={register}
                  errors={errors}
                  label="Password"
                  name="password"
                  icon={Lock}
                  placeholder="Password"
                  type="password"
                  required
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Upload a profile picture for the client</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageInput
                title="Client Profile Image"
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                endpoint="clientProfileImage"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/dashboard/clients"
        editingId={editingId}
        loading={loading}
        title="Client"
        parent="Clients"
      />
    </form>
  );
}
