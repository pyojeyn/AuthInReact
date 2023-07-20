import AuthForm from "../components/AuthForm";
import { json, redirect } from "react-router-dom";

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  console.log("searchParams", searchParams);
  const mode = searchParams.get("mode") || "login";

  if (mode !== "login" && mode !== "signup") {
    throw json({ message: "Unsupported mode. " }, { status: 422 });
  }

  const data = await request.formData();
  const authData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch("http://localhost:8080/" + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authData),
  });

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Could not authenticate user. " }, { status: 500 });
  }

  const resData = await response.json();
  const token = resData.token;
  console.log("token", token);

  // 브라우저 API 인 로컬 스토리지에 저장
  // 저장하는 겁니다, 왜냐하면 꼭 기억해야 하는데
  // 이 작업 함수에 있는 이 코드는 라우저에서 구동되기 때문이죠
  // 그래서 여기 있는 모든 표준 브라우저 기능을 사용할 수 있어요
  localStorage.setItem("token", token);

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  localStorage.setItem("expiration", expiration.toISOString());

  return redirect("/");
}
