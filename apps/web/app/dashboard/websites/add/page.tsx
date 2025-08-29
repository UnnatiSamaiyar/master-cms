import React from "react";
import AddWebsiteForm from "@/components/forms/websites/add";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Website",
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Globe className="h-6 w-6 text-blue-700" />
            Add a website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddWebsiteForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
