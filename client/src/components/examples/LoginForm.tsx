import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return <LoginForm onBack={() => console.log('Back button clicked')} />;
}