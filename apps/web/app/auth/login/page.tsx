import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import React from "react";
import LoginForm from "@/components/forms/login";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PasswordResetrequest from "@/components/settings/password-reset-request";
import { Button } from "@/components/ui/button";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Welcome back! Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-600">
            Forgot your password?
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  aria-label="Reset password"
                  variant="link"
                  className="ml-0"
                >
                  Reset password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset password request</DialogTitle>
                  <DialogDescription>
                    We will send a verification email to your existing email.
                    Please ensure that you have type correct email.
                  </DialogDescription>
                </DialogHeader>
                <PasswordResetrequest />
              </DialogContent>
            </Dialog>{" "}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
