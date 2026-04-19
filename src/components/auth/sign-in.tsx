"use client";

import { SignInFormSchema } from "@/schemas/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState } from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
} from "react-hook-form";
import z from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoaderCircle } from "lucide-react";
import { useAuthState } from "@/hooks/use-auth-state";
import FormError from "../form-error";
import FormSuccess from "../form-success";

type SignInFormValues = z.infer<typeof SignInFormSchema>;

export default function SignIn() {
  const router = useRouter();
  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState,
  } = useAuthState();

  const form = useForm({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const renderEmailInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<SignInFormValues, "email">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignInFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>邮箱地址</FieldLabel>
        <Input
          id="email"
          aria-invalid={fieldState.invalid}
          placeholder="请输入邮箱地址"
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  const renderPasswordInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<SignInFormValues, "password">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignInFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id="password"
          aria-invalid={fieldState.invalid}
          placeholder="请输入密码"
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  async function onSubmit(data: SignInFormValues) {
    const { email, password } = data;

    try {
      await await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            resetState();
            setLoading(true);
          },
          onSuccess: () => {
            setSuccess("登录成功");
            router.replace("/dashboard");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        },
      );
    } catch (error) {
      setError("网络错误，请稍后重试。");
      console.error(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>用户登录</CardTitle>
          <CardDescription>输入邮箱地址和密码访问你的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={renderEmailInput}
            />
            <Controller
              name="password"
              control={form.control}
              render={renderPasswordInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}
          <Field orientation="horizontal">
            <Button variant="default" className="flex-1" disabled={loading}>
              {loading && <LoaderCircle className="animate-spin" />}
              登录
            </Button>
          </Field>
          <Field orientation="horizontal">
            <Link
              href="/auth/forgot-password"
              className={`flex-1 ${buttonVariants({
                variant: "secondary",
              })}`}
            >
              忘记密码
            </Link>
          </Field>
          <Field orientation="horizontal">
            <Link
              href="/auth/sign-up"
              className={`flex-1 ${buttonVariants({
                variant: "secondary",
              })}`}
            >
              没有账号，去注册
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
