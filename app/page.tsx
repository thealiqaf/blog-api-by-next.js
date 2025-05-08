"use client"

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {

  const [formData, setFormData] = useState({
    // name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // try {
    //   const res = await fetch("/api/user/signup", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify( formData)
    //   });
  
    //   const data = await res.json();
  
    //   if (!res.ok) {
    //     // show error message
    //     console.error("Error:", data);
    //     alert(data || "Something went wrong");
    //     return;
    //   }
  
    //   // success logic
    //   console.log("User registered:", data);
    //   alert("Signup successful!");
  
    //   // optionally reset form
    //   setFormData({ name: "", email: "", password: "" });
    // } catch (error) {
    //   console.error("Request failed:", error);
    //   alert("Network error or server failure");
    // }

    signIn('credentials', formData)
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={handleSubmit}>
        {/* <input type="text" placeholder="name" onChange={(e) => setFormData({...formData, name: e.target.value})} /> */}
        <input type="email" placeholder="email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button type="submit">submit</button>
      </form>
      {/* {formData.name} {"   "} */}
      {formData.email}{"   "}
      {formData.password} {"   "}
    </div>
  );
}
