"use client";

import { SignUpFormSchema } from "@/schemas/auth";
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
import { AlertCircleIcon, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export default function SignUp() {
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
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const renderNameInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<SignUpFormValues, "name">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignUpFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
        <Input
          id="name"
          aria-invalid={fieldState.invalid}
          placeholder="请输入用户名"
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  const renderEmailInput = function ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<SignUpFormValues, "email">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignUpFormValues>;
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
    field: ControllerRenderProps<SignUpFormValues, "password">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignUpFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id="password"
          type="password"
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
    field: ControllerRenderProps<SignUpFormValues, "confirmPassword">;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<SignUpFormValues>;
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>确认密码</FieldLabel>
        <Input
          id="confirmPassword"
          type="password"
          aria-invalid={fieldState.invalid}
          placeholder="请再次输入密码"
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    );
  };

  const onSubmit = async (data: SignUpFormValues) => {
    const { email, name, password } = data;
    try {
      await await authClient.signUp.email(
        {
          email,
          name,
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
            setSuccess("注册成功");
            router.replace("/");
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
          <CardTitle>用户注册</CardTitle>
          <CardDescription>创建一个新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={renderNameInput}
            />
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
            <Button variant="default" className="flex-1" disabled={loading}>
              {loading && <LoaderCircle className="animate-spin" />}
              注册
            </Button>
          </Field>
          <Field orientation="horizontal">
            <Link
              href="/auth/sign-in"
              className={`flex-1 ${buttonVariants({
                variant: "secondary",
              })}`}
            >
              已有账号，去登录
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
