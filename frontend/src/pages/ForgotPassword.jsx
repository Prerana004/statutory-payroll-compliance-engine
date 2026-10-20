function ForgotPassword() {
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <input placeholder="Enter your email" />
        <button>Send Reset Link</button>
      </div>
    </div>
  );
}

export default ForgotPassword;
