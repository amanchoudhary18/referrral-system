import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

function AssignmentModal({
  show,
  onHide,
  isEditing,
  selectedAssignment,
  getData,
  setSelectedAssignment,
  setIsEditing,
}) {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [assignmentData, setAssignmentData] = useState({
    clientName: "",
    fileName: "",
    referralCode: "",
    deadline: "",
    amount: "",
  });

  const checkReferralCode = async (referralCode) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(
      "/api/v1/user/checkReferralCode",
      { referralCode },
      config
    );

    return { user: response.data.user, exists: response.data.exists };
  };

  const handleFormSubmit = async () => {
    try {
      // Trim extra spaces from all fields
      const trimmedAssignmentData = {
        clientName: assignmentData.clientName.trim(),
        fileName: assignmentData.fileName.trim(),
        referralCode: assignmentData.referralCode.trim(),
        deadline: assignmentData.deadline,
        amount: assignmentData.amount.trim(),
      };

      // Check if any field is empty
      for (const field in trimmedAssignmentData) {
        if (trimmedAssignmentData[field] === "") {
          throw new Error("Please fill in all fields.");
        }
      }

      const check = await checkReferralCode(trimmedAssignmentData.referralCode);
      if (!check.exists) {
        throw new Error("Referral Code invalid");
      }

      if (isEditing) {
        const response = await axios.put(
          `/api/v1/assignment/assignments/${selectedAssignment._id}`,
          { ...trimmedAssignmentData },
          config
        );

        toast("Assignment edited successfully!", { type: "success" });
        setAssignmentData({
          clientName: "",
          fileName: "",
          referralCode: "",
          deadline: "",
          amount: "",
        });
        setIsEditing(false);
        onHide();
        getData();
      } else {
        const response = await axios.post(
          "/api/v1/assignment/assignments",
          trimmedAssignmentData,
          config
        );

        onHide();
        toast("Assignment added successfully!", { type: "success" });
        setAssignmentData({
          clientName: "",
          fileName: "",
          referralCode: "",
          deadline: "",
          amount: "",
        });
        getData();
      }
    } catch (error) {
      console.error("Error adding/editing assignment:", error);
      toast(`${error.message}`, { type: "error" });
    }
  };

  function isDataUnchanged(originalData, newData) {
    return (
      originalData.clientName === newData.clientName &&
      originalData.fileName === newData.fileName &&
      originalData.referralCode === newData.referralCode &&
      originalData.deadline.split("T")[0] === newData.deadline &&
      originalData.amount === newData.amount
    );
  }

  useEffect(() => {
    if (isEditing) {
      const { clientName, fileName, referralCode, deadline, amount } =
        selectedAssignment;

      setAssignmentData({
        clientName,
        fileName,
        referralCode,
        deadline: new Date(deadline).toISOString().split("T")[0],
        amount,
      });
    }
  }, [isEditing, selectedAssignment]);

  return (
    <Modal
      show={show}
      onHide={() => {
        setAssignmentData({
          clientName: "",
          fileName: "",
          referralCode: "",
          deadline: "",
          amount: "",
        });
        onHide();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? "Edit Assignment" : "Add Assignment"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="clientName">
            <Form.Label>Client Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter client name"
              value={assignmentData.clientName}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  clientName: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group controlId="fileName">
            <Form.Label>File Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter file name"
              value={assignmentData.fileName}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  fileName: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group controlId="referralCode">
            <Form.Label>Referral Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter referral code"
              value={assignmentData.referralCode}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  referralCode: e.target.value,
                })
              }
              disabled={isEditing}
            />
          </Form.Group>

          <Form.Group controlId="deadline">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              value={assignmentData.deadline}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  deadline: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter amount"
              value={assignmentData.amount}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, amount: e.target.value })
              }
            />
          </Form.Group>

          <Button
            variant="primary"
            type="button"
            onClick={handleFormSubmit}
            disabled={
              isEditing && isDataUnchanged(selectedAssignment, assignmentData)
            }
            className="my-2"
          >
            {isEditing ? "Save Changes" : "Submit"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AssignmentModal;
