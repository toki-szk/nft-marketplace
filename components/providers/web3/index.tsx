import { createContext, FC, useContext, useState } from "react";

const Web3Context = createContext<any>(null);
interface Props {
  children: React.ReactNode;
}
const Web3Provider: FC<Props> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState({ test: "hello Provider" });
  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};

export default Web3Provider;
