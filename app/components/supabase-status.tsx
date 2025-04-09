/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase/supabase-client";
import { testSupabaseConnection } from "../../lib/supabase/connectivity-check";

export default function SupabaseStatus() {
  const [status, setStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [message, setMessage] = useState<string>(
    "Checking Supabase connection..."
  );

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus("checking");

        // Get the Supabase URL from environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
          setStatus("disconnected");
          setMessage("Supabase URL not configured");
          return;
        }

        // Test basic connection to Supabase domain
        const canConnect = await testSupabaseConnection(supabaseUrl);
        // if (!canConnect) {
        //   setStatus('disconnected');
        //   setMessage('');
        //   return;
        // }

        // Test if Supabase API is functioning
        const { data, error } = await supabase
          .from("test_connection")
          .select("count")
          .limit(1)
          .maybeSingle();

        if (
          error &&
          (error.message.includes(
            'relation "test_connection" does not exist'
          ) ||
            error.code === "42P01")
        ) {
          // This error is expected if the table doesn't exist, but means we're connected to Supabase
          setStatus("connected");
          // setMessage('Connected to Supabase database (data will be stored remotely)');
        } else if (error) {
          console.error("Supabase connection error:", error);
          setStatus("disconnected");
          setMessage(`Database error: ${error.message}`);
        } else {
          setStatus("connected");
          // setMessage('Connected to Supabase database (data will be stored remotely)');
        }
      } catch (err) {
        console.error("Failed to check Supabase status:", err);
        setStatus("disconnected");
        // setMessage('Error connecting to Supabase. Using local storage fallback.');
      }
    };

    checkConnection();
  }, []);

  if (status === "checking") {
    return (
      <div className="bg-yellow-50 p-2 rounded-md text-sm">
        <div className="flex items-center">
          <svg
            className="animate-spin h-4 w-4 mr-2 text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="bg-green-50 p-2 rounded-md text-sm">
        <div className="flex items-center">
          <svg
            className="h-4 w-4 mr-2 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-2 rounded-md text-sm">
      <div className="flex items-center">
        <svg
          className="h-4 w-4 mr-2 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}
