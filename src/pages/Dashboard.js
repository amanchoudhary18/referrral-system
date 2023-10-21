import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import copy from "../assets/copy.png";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import AssignmentModal from "../components/AssignmentModal";
import AssignmentTable from "../components/AssignmentTable";
import WithdrawalModel from "../components/WithdrawalModel";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState();
  const [referralLink, setReferralLink] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState();
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openWithdrawal = () => {
    setIsWithdrawalOpen(true);
  };

  const closeWithdrawal = () => {
    setIsWithdrawalOpen(false);
  };

  const onEdit = (assignment) => {
    console.log(assignment);
    setIsEditing(true);
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (assignment) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `/api/v1/assignment/assignments/${assignment._id}`,
        config
      );
      console.log(response);
      toast("Assignment successfully deleted", { type: "success" });
      getData();
    } catch (error) {
      console.log(error);
      toast(`${error.response.data.error}`, { type: "error" });
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `https://wa.me/1XXXXXXXXXX?code=${referralLink}`
    );
    toast("Copied", { type: "success" });
  };

  const getData = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const user = await axios.get("/api/v1/user/myData", config);

    const assignments = await axios.get(
      "/api/v1/assignment/assignments",
      config
    );

    if (user.data.user.admin)
      setAssignments(assignments.data.filter((e) => e.completed === false));
    else {
      assignments.data.forEach((e) =>
        console.log(e.referralCode, referralLink)
      );
      setWithdrawalAmount(user.data.user.amount);
      setAssignments(
        assignments.data.filter(
          (e) =>
            e.completed === false &&
            e.referralCode === user.data.user.referralCode
        )
      );
    }
    setReferralLink(user.data.user.referralCode);
    setIsAdmin(user.data.user.admin);
  };

  const handleWithdrawal = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/api/v1/user/withdrawAmount", config);
      toast("Your withdrawal request has been placed", { type: "sucess" });
    } catch (error) {
      console.log(error);
      toast(`${error.message}`, { type: "error" });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `/api/v1/user/${isAdmin ? "logout/admin" : "logout/user"}`,
        config
      );
      localStorage.removeItem("token");
      toast("Logged Out Successfully", { type: "success" });
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast(`${error.message}`, { type: "error" });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="mx-5 mt-3">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <h3>Dashboard</h3>
        {isAdmin ? (
          <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <Button variant="primary" onClick={openModal}>
              + Add Assignment
            </Button>
            <Button
              style={{ backgroundColor: "green" }}
              onClick={openWithdrawal}
            >
              ✓ Approve Withdrawal
            </Button>
            <div
              className="my-2"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faPowerOff} color="red" />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <h5 className="my-2">Rs. {withdrawalAmount}</h5>
            <Button
              variant="primary"
              onClick={handleWithdrawal}
              disabled={withdrawalAmount === 0}
            >
              Withdraw Amount
            </Button>

            <div
              className="my-2"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faPowerOff} color="red" />
            </div>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="referral-link-container">
          <div className="referral-link">
            <input
              type="text"
              value={`https://wa.me/1XXXXXXXXXX?code=${referralLink}`}
              readOnly
            />
            <button onClick={copyToClipboard}>
              <img src={copy} alt="copy" />
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <AssignmentModal
          show={isModalOpen}
          onHide={closeModal}
          isEditing={isEditing}
          selectedAssignment={selectedAssignment}
          getData={getData}
          setSelectedAssignment={setSelectedAssignment}
          setIsEditing={setIsEditing}
        />
      )}

      {isAdmin && (
        <WithdrawalModel
          show={isWithdrawalOpen}
          onHide={closeWithdrawal}
          getData={getData}
        />
      )}

      <div className="my-5">
        <AssignmentTable
          assignments={assignments}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={handleDelete}
          getData={getData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
