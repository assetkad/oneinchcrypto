import { ABI } from '../abi';
import { sepoliaStaking } from '../sepolia-abi';

export interface AbiEl {
  anonymous: boolean;
  inputs: {
    indexed: boolean;
    internalType: string;
    name: string;
    type: string;
  }[];
  name: string;
  type: string;
}

export abstract class AbstractAbiInjector {
  ABI!: AbiEl[];
  sepoliaStaking!: AbiEl[];
}

const InjedtedAbi = {
  ABI,
  sepoliaStaking,
};

export const AbiProvider = {
  provide: AbstractAbiInjector,
  useValue: InjedtedAbi,
};
