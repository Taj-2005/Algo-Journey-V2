"use client"
import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import img2 from '@/images/signup.png'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image'
import { fetchLatestSubmissionsCodeForces, fetchLatestSubmissionsLeetCode } from "@/serverActions/fetch";

// Validation schema remains the same
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email").refine(
    (email) => email.endsWith("@nst.rishihood.edu.in") || email.endsWith("@sst.scaler.com") || email.endsWith("@adypu.edu.in"),
    "Must use college email"
  ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  leetcodeUsername: z.string().min(1, "Leetcode username is required"),
  codeforcesUsername: z.string().min(1, "Codeforces username is required"),
  enrollmentNum: z.string().min(1, "Enrollment number is required"),
  section: z.enum(['A', 'B', 'C', 'D', 'E'])
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const Router = useRouter()
  const { data:session } = useSession()
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: email ?? '',
      password: "",
      leetcodeUsername: "",
      codeforcesUsername: "",
      enrollmentNum: "",
      section: undefined
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const checkLeet = await fetchLatestSubmissionsLeetCode(data.leetcodeUsername)
      if(!checkLeet) return toast.error("Invalid Leetcode Username")
      const checkCodeforces = await fetchLatestSubmissionsCodeForces(data.codeforcesUsername)
      if(!checkCodeforces) return toast.error("Invalid Codeforces Username")
      const signupResponse = await axios.post("/api/auth/signup", data, {
        headers: { "Content-Type": "application/json" }
      });
      if (signupResponse.status !== 200) {
        toast.error("Failed to create account. Please try again.");
        return;
      }
      toast.success("Signup successful!");
      Router.push('/auth/signin');
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("An error occurred during signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  if(session) {
    Router.push('/user/dashboard')
  }

  return (
    <div className="flex min-h-screen p-10">
      <div className="hidden lg:flex items-center justify-center flex-1 bg-gray-50">
        <div className="max-w-2xl px-8">
          <Image
            src={img2}
            alt="Login Page"
            width={700}
            height={700}
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <UserPlus className="w-6 h-6" />
              Create Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Join our platform with your college credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a unique username" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field} 
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="Strong password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          >
                            {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leetcodeUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leetcode Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Leetcode profile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="codeforcesUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codeforces Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Codeforces profile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="enrollmentNum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Number</FormLabel>
                        <FormControl>
                          <Input placeholder="College ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                              <SelectItem key={sec} value={sec}>
                                Section {sec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing Up..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}