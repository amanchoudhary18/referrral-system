import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

function WithdrawalModel({ show, onHide, getData }) {
  const [withdrawData, setWithdrawData] = useState({
    referralCode: "",
    name: "",
    totalEarnings: "",
    amountToWithdraw: "",
  });

  const [userFetched, setUserFetched] = useState(false); // State to track if user data has been fetched

  const handleFormSubmit = async () => {
    // Your submit logic here
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (withdrawData.referralCode.length === 9) {
        const response = await axios.post(
          "/api/v1/user/approveWithdrawal",
          { referralCode: withdrawData.referralCode },
          config
        );

        toast("Successful withdrawal", { type: "success" });
        onHide();
        getData();
      }
    } catch (error) {
      console.log(error);
      toast(`${error.message}`, { type: "error" });
    }
  };

  const getUserByReferral = async (referralCode) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (referralCode.length === 9) {
        const response = await axios.post(
          "/api/v1/user/getUserByReferral",
          { referralCode: referralCode },
          config
        );

        const user = response.data.user;
        setWithdrawData({
          ...withdrawData,
          name: user.name,
          totalEarnings: user.total_earnings,
          amountToWithdraw: user.amount, // Assuming that "amount" is the correct field.
        });

        setUserFetched(true); // Set the state to indicate that user data has been fetched
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setWithdrawData({
          referralCode: "",
          name: "",
          totalEarnings: "",
          amountToWithdraw: "",
        });
        setUserFetched(false); // Reset the state when closing the modal
        onHide();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Approve Withdrawal Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="referralCode">
            <Form.Label>Referral Code</Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => {
                setWithdrawData({
                  ...withdrawData,
                  referralCode: e.target.value,
                });
              }}
              value={withdrawData.referralCode}
            />
          </Form.Group>

          {userFetched && ( // Only render the fields if user data has been fetched
            <div>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" readOnly value={withdrawData.name} />
              </Form.Group>

              <Form.Group controlId="totalEarnings">
                <Form.Label>Total Earnings</Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={withdrawData.totalEarnings}
                />
              </Form.Group>

              <Form.Group controlId="amountToWithdraw">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  value={withdrawData.amountToWithdraw}
                  onChange={(e) => {
                    setWithdrawData({
                      ...withdrawData,
                      amountToWithdraw: e.target.value,
                    });
                  }}
                />
              </Form.Group>
            </div>
          )}

          {userFetched ? (
            <Button
              variant="primary"
              type="button"
              onClick={handleFormSubmit}
              className="my-2"
            >
              Approve
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={() => getUserByReferral(withdrawData.referralCode)}
              className="my-2"
            >
              Fetch User
            </Button>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default WithdrawalModel;
