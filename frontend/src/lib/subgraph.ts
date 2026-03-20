import { GraphQLClient, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/defi-super';

export const subgraphClient = new GraphQLClient(SUBGRAPH_URL);

// Empty state to ensure the UI remains clean even if the subgraph is down
const EMPTY_STATS: ProtocolStatsResponse = {
  pools: [],
  loans: [],
  flashLoanEvents: [],
  isError: false
};

export async function fetchProtocolStats(): Promise<ProtocolStatsResponse> {
  try {
    const data = await subgraphClient.request<ProtocolStatsResponse>(GET_PROTOCOL_STATS);
    return { ...data, isError: false };
  } catch (error) {
    return { ...EMPTY_STATS, isError: true };
  }
}

export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    pools {
      id
      token0
      token1
      reserve0
      reserve1
      totalVolume0
      totalVolume1
    }
    loans {
      collateralAmount
      borrowAmount
    }
    flashLoanEvents {
      fee
    }
  }
`;

export interface SubgraphPool {
  id: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalVolume0: string;
  totalVolume1: string;
}

export interface SubgraphLoan {
  collateralAmount: string;
  borrowAmount: string;
}

export interface SubgraphFlashLoan {
  fee: string;
}

export interface ProtocolStatsResponse {
  pools: SubgraphPool[];
  loans: SubgraphLoan[];
  flashLoanEvents: SubgraphFlashLoan[];
  isError: boolean;
}
