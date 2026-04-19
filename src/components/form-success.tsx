import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CircleCheck } from "lucide-react";

type FormProps = {
  message?: string;
  title?: string;
};

const FormSuccess = ({ title = "完成", message }: FormProps) => {
  if (!message) return null;

  return (
    <Alert variant="default">
      <CircleCheck />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default FormSuccess;
