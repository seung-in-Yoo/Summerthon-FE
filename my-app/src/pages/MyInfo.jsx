import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container/Container";
import Input from "../components/Input/Input";
import Flex from "../components/Flex/Flex";
import authApi from "../apis/authApi";
import AddButton from "../components/Button/AddButton";
import Header2 from "../components/Header/Header2";
import AddAddressModal from "../components/Modal/AddAddressModal";
import AddProtectorModal from "../components/Modal/AddProtectorModal";
import useForm from "../hooks/useForm";

const InfoForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 10px;
  margin: 30px 0; //
  max-width: 400px;
  text-align: left;
`;

function MyInfo() {
  const [userInfo, setUserInfo] = useState({
    user_login_id: "",
    password: "",
    user_name: "",
    user_gender: "",
    user_phone: "",
    user_age: "1",
    protector_name: "",
    protector_email: "",
    represent_address: "",
  });

  const [newData, setNewData] = useState(() => {
    const savedData = localStorage.getItem("newData"); // 로컬 스토리지 설정
    return savedData ? JSON.parse(savedData) : [];
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProtectorModalOpen, setIsProtectorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // 추가 정보를 보기 위한 navigate 추가

  const { values, handleChange } = useForm({
    address_name: "",
    road_address: "",
    detail_address: "",
    protector_name: "",
    protector_email: "",
  });

  // 내 정보를 받아오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authApi.get("/me");
        const data = response.data;
        setUserInfo({
          user_login_id: data.user.user_login_id,
          password: data.user.password,
          user_name: data.user.user_name,
          user_gender: data.user.user_gender,
          user_phone: data.user.user_phone,
          user_age: data.user.user_age,
          protector_name: data.represent_protector.protector_name,
          protector_email: data.represent_protector.protector_email,
          represent_address: data.represent_address,
        });
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };
    fetchUserInfo();
  }, []);

  // 새로운 추가 등록이 있다면 로컬 스토리지에 업데이트
  useEffect(() => {
    localStorage.setItem("newData", JSON.stringify(newData));
  }, [newData]);

  const handleAddAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddProtector = () => {
    setIsProtectorModalOpen(true);
  };

  // 주소지 추가 등록 처리
  const handleSubmitAddress = async () => {
    const pageData = {
      address_name: values.address_name,
      road_address: values.road_address,
      detail_address: values.detail_address,
    };

    try {
      const response = await authApi.post("/new/addresses", pageData, {
        headers: {
          // json 형식으로 수정
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("주소지가 성공적으로 등록되었습니다.");
        setNewData((prevData) => [...prevData, pageData]);
        setIsAddressModalOpen(false); // 모달 닫기
      }
    } catch (error) {
      console.error("Failed to submit new address", error);
      if (error.response && error.response.data) {
        setErrorMessage(
          `주소지 등록에 실패했습니다: ${error.response.data.message}`
        );
      } else {
        setErrorMessage("주소지 등록에 실패했습니다.");
      }
    }
  };

  // 보호자 추가 등록 처리
  const handleSubmitProtector = async () => {
    const pageData = {
      protector_name: values.protector_name,
      protector_email: values.protector_email,
    };

    try {
      const response = await authApi.post("/new/protectors", pageData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("보호자가 성공적으로 등록되었습니다.");
        setNewData((prevData) => [...prevData, pageData]);
        setIsProtectorModalOpen(false); // 모달 닫기
      }
    } catch (error) {
      console.error("Failed to submit new protector", error);
      if (error.response && error.response.data) {
        setErrorMessage(
          `보호자 등록에 실패했습니다: ${error.response.data.message}`
        );
      } else {
        setErrorMessage("보호자 등록에 실패했습니다.");
      }
    }
  };

  const handleMoreInfo = () => {
    navigate("/more-me");
  };

  return (
    <Container>
      <Header2>내 정보</Header2>
      <Flex direction="column" align="center">
        <InfoForm>
          <Input label="이름" value={userInfo.user_name} readOnly />
          <Input label="나이" value={userInfo.user_age} readOnly />
          <Input label="성별" value={userInfo.user_gender} readOnly />
          <Input label="보호자 이름" value={userInfo.protector_name} readOnly />
          <Input
            label="보호자 이메일"
            value={userInfo.protector_email}
            readOnly
          />
          <Input label="주소지" value={userInfo.represent_address} readOnly />
        </InfoForm>
        <Flex direction="row">
          <AddButton text="주소지 추가 등록" onClick={handleAddAddress} />
          <AddButton text="보호자 추가 등록" onClick={handleAddProtector} />
        </Flex>
        <AddButton
          text="추가 등록한 정보 보기"
          width="180px"
          onClick={handleMoreInfo}
        />
      </Flex>
      {/* 주소지 추가 모달 열기 */}
      <AddAddressModal
        isModalOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleSubmitAddress}
        newPageData={values}
        handleInputChange={handleChange}
        errorMessage={errorMessage}
      />
      {/* 보호자 추가 모달 열기 */}
      <AddProtectorModal
        isModalOpen={isProtectorModalOpen}
        onClose={() => setIsProtectorModalOpen(false)}
        onConfirm={handleSubmitProtector}
        newPageData={values}
        handleInputChange={handleChange}
        errorMessage={errorMessage}
      />
    </Container>
  );
}

export default MyInfo;
