import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, InputGroup, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Login");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLogin = async () => {
    try {
      if (activeTab === "Login") {
        const formData = { email, password };
        const res = await axios.post("/api/v1/user/login", formData);

        localStorage.setItem("token", res.data.token);
        toast("Successfully Logged In", { type: "success" });
        navigate("/dashboard");
      } else {
        const formData = { name, email, password, phone_number: phone };
        const res = await axios.post("/api/v1/user/register", formData);
        toast("Successfully Registered", { type: "success" });
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast(`${error.response.data.error}`, { type: "error" });
      setPassword("");
    }
  };

  return (
    <Container className="p-3 my-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          {activeTab === "Login" ? (
            <>
              <h3>Welcome Again!</h3>
              <p className="secondary-text">
                Enter your details to sign in your account
              </p>
            </>
          ) : (
            <>
              <h3>Welcome!</h3>
              <p className="secondary-text">Enter your details to sign up</p>
            </>
          )}
          <Form>
            {activeTab === "Register" && (
              <Form.Group controlId="formBasicName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
            )}

            {activeTab === "Register" && (
              <Form.Group controlId="formBasicNumber" className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>
            )}

            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="outline-primary"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              className="w-100"
              type="button"
              onClick={handleLogin}
            >
              {activeTab === "Login" ? "Sign in" : "Sign up"}
            </Button>

            {activeTab === "Login" ? (
              <p className="text-center mt-3">
                Not a member?{" "}
                <span
                  style={{
                    color: "blue",
                    cursor: "pointer",
                  }}
                  onClick={() => handleTabClick("Register")}
                >
                  Register
                </span>
              </p>
            ) : (
              <p className="text-center mt-3">
                Already a member?{" "}
                <span
                  style={{
                    color: "blue",
                    cursor: "pointer",
                  }}
                  onClick={() => handleTabClick("Login")}
                >
                  Login
                </span>
              </p>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
