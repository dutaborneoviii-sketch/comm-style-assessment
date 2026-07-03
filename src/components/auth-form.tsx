"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sedang masuk..." : "Masuk / Daftar"}
    </Button>
  );
}

export function AuthForm() {
  const [errorMessage, setErrorMessage] = useState("");

  async function action(formData: FormData) {
    const res = await authenticate(formData);
    if (res?.error) {
      setErrorMessage(res.error);
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto shadow-2xl glass-card border-white/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Selamat datang</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk masuk atau membuat akun secara otomatis.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@contoh.com" required />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {errorMessage && (
            <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
