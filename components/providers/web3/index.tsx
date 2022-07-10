import { createContext, FC, useContext, useState } from "react";
import { createDefaultState, Web3State } from "./utils";

const Web3Context = createContext<Web3State>(createDefaultState());
interface Props {
  children: React.ReactNode;
}
const Web3Provider: FC<Props> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());
  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};

export default Web3Provider;
