import React from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

const AssignmentTable = ({
  assignments,
  onEdit,
  onDelete,
  isAdmin,
  getData,
}) => {
  const handleComplete = async (assignment) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `/api/v1/assignment/complete/${assignment._id}`,
        config
      );

      toast("Assignment marked complete", { type: "success" });
      getData();
    } catch (error) {
      console.log(error);
      toast(`${error.message}`, { type: "error" });
    }
  };

  return (
    <Table striped responsive>
      <thead>
        <tr>
          <th>Client Name</th>
          <th>File Name</th>
          <th>Referral Code</th>
          <th>Deadline</th>
          <th>Amount</th>
          {isAdmin && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {assignments.map((assignment, index) => (
          <tr key={index}>
            <td>{assignment.clientName}</td>
            <td>{assignment.fileName}</td>
            <td>{assignment.referralCode}</td>
            <td>
              {new Date(assignment.deadline).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </td>
            <td>{isAdmin ? assignment.amount : assignment.amount * 0.1}</td>
            {isAdmin && (
              <td>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                  }}
                >
                  <div onClick={() => onEdit(assignment)}>
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{
                        fontSize: "16px",
                        color: "blue",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div onClick={() => onDelete(assignment)}>
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{
                        fontSize: "16px",
                        color: "red",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  <div onClick={() => handleComplete(assignment)}>
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{
                        fontSize: "16px",
                        color: "green",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AssignmentTable;
