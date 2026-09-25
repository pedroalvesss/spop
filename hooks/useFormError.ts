"use client";

import { useEffect, useState } from "react";
import {
  get,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

// Mostra um erro só, na ordem dos campos (como no protótipo), e limpa assim que a pessoa digita.
export function useFormError<T extends FieldValues>(
  form: UseFormReturn<T>,
  order: Path<T>[],
) {
  const [serverError, setServerError] = useState("");
  const { watch, clearErrors } = form;

  useEffect(() => {
    const sub = watch(() => {
      clearErrors();
      setServerError("");
    });
    return () => sub.unsubscribe();
  }, [watch, clearErrors]);

  const fieldError = order
    .map(
      (field) =>
        get(form.formState.errors, field)?.message as string | undefined,
    )
    .find(Boolean);

  return { error: fieldError ?? serverError, setServerError };
}
