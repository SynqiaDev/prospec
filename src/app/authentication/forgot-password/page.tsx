import ForgotPasswordForm from "./_components/forgot-password-form";

const ForgotPasswordPage = async () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="w-full max-w-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
