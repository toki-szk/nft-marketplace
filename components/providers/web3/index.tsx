import { createContext, FC, useContext, useEffect, useState } from "react";
import { createDefaultState, loadContract, Web3State } from "./utils";
import { ethers } from "ethers";
import loadConfig from "next/dist/server/config";
const Web3Context = createContext<Web3State>(createDefaultState());
interface Props {
  children: React.ReactNode;
}

const Web3Provider: FC<Props> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  useEffect(() => {
    const initWeb3 = async () => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const contract = await loadContract("NftMarket", provider);

      setWeb3Api({
        ethereum: window.ethereum,
        provider,
        contract,
        isLoading: false,
      });
    };
    initWeb3();
  }, []);
  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};

export default Web3Provider;
