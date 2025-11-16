import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome {user?.name}!</h1>
    </div>
  );
};

export default Home;
