import LoginModel from "../components/LoginModel";

function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen min-w-screen bg-white">
            <div className="min-h-screen w-2/3" id='DivModel'>
                <LoginModel />
            </div>
        </div>
    )
}
export default LoginPage;