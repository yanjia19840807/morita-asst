"use client";

import { ResetPasswordFormSchema } from "@/schemas/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn,
} from "react-hook-form";
import { z } from "zod";
import { useAuthState } from "@/hooks/use-auth-state";
import FormError from "../form-error";
import FormSuccess from "../form-success";

type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState,
  } = useAuthState();
  const token = searchParams.get("token");
  const form = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const renderPasswordInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<ResetPasswordFormValues, "password">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<ResetPasswordFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id="password"
          type="password"
          disabled={!token}
          aria-invalid={fieldState.invalid}
          placeholder="请输入密码"
          {...field}
        />
        <FieldDescription>长度为8-30个字符</FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  const renderConfirmPasswordInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<ResetPasswordFormValues, "confirmPassword">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<ResetPasswordFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>确认密码</FieldLabel>
        <Input
          id="confirmPassword"
          type="password"
          aria-invalid={fieldState.invalid}
          placeholder="请再次输入密码"
          disabled={!token}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      return;
    }

    const { password } = data;

    try {
      await authClient.resetPassword(
        {
          newPassword: password,
          token,
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
            setSuccess("密码修改成功");
            router.replace("/auth/sign-in");
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
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>设置密码</CardTitle>
          <CardDescription>设置一个新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={renderPasswordInput}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={renderConfirmPasswordInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}
          <Field orientation="horizontal">
            <Button
              variant="default"
              className="flex-1"
              disabled={loading || !token}
            >
              {loading && <LoaderCircle className="animate-spin" />}
              提交
            </Button>
          </Field>
          <Field orientation="horizontal">
            <Link
              href="/auth/sign-in"
              className={`flex-1 ${buttonVariants({
                variant: "secondary",
              })}`}
            >
              返回登录
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
