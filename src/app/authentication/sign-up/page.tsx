import SignUpForm from "./_components/sign-up-form";
import Image from "next/image";

const SignUpPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="w-full max-w-lg">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
