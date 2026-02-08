/**
 * Blockchain Service - Combines Web3 and API interactions
 */
import web3Service from './web3';
import * as api from './api';

class BlockchainService {
  /**
   * Register drug with full workflow
   */
  async registerDrugComplete(drugData) {
    try {
      // Step 1: Validate composition with backend
      const validation = await api.validateComposition(
        drugData.drugName,
        drugData.composition
      );

      if (!validation.isValid) {
        throw new Error(`Composition validation failed: ${validation.message}`);
      }

      // Step 2: Register via backend (generates hash and prepares transaction)
      const backendResponse = await api.registerDrug({
        batchId: drugData.batchId,
        drugName: drugData.drugName,
        composition: drugData.composition,
        manufactureDate: drugData.manufactureDate,
        expiryDate: drugData.expiryDate,
        manufacturerAddress: web3Service.getAccount()
      });

      // Step 3: Execute blockchain transaction
      const txResult = await web3Service.registerDrug(
        drugData.batchId,
        drugData.drugName,
        backendResponse.compositionHash,
        drugData.manufactureDate,
        drugData.expiryDate
      );

      return {
        success: true,
        message: 'Drug registered successfully',
        batchId: drugData.batchId,
        compositionHash: backendResponse.compositionHash,
        transactionHash: txResult.transactionHash,
        blockNumber: txResult.blockNumber
      };
    } catch (error) {
      console.error('Complete drug registration error:', error);
      throw error;
    }
  }

  /**
   * Transfer ownership with full workflow
   */
  async transferOwnershipComplete(batchId, newOwner, location) {
    try {
      // Step 1: Validate transfer with backend
      const transferData = {
        batchId,
        fromAddress: web3Service.getAccount(),
        toAddress: newOwner,
        location
      };

      await api.transferOwnership(transferData);

      // Step 2: Execute blockchain transaction
      const txResult = await web3Service.transferOwnership(
        batchId,
        newOwner,
        location
      );

      return {
        success: true,
        message: 'Ownership transferred successfully',
        batchId,
        transactionHash: txResult.transactionHash,
        blockNumber: txResult.blockNumber
      };
    } catch (error) {
      console.error('Complete ownership transfer error:', error);
      throw error;
    }
  }

  /**
   * Verify drug with complete data
   */
  async verifyDrugComplete(batchId) {
    try {
      // Get verification data from backend (includes composition)
      const backendData = await api.verifyDrug(batchId);

      // Get blockchain data
      const blockchainData = await web3Service.verifyDrug(batchId);

      // Get ownership history
      const history = await web3Service.getDrugHistory(batchId);

      // Combine all data
      return {
        ...backendData,
        blockchainVerification: blockchainData,
        ownershipHistory: history,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Complete drug verification error:', error);
      throw error;
    }
  }

  /**
   * Get complete drug information
   */
  async getDrugComplete(batchId) {
    try {
      // Get from blockchain
      const blockchainData = await web3Service.getDrug(batchId);

      // Get from backend (includes composition)
      const backendData = await api.getDrugInfo(batchId);

      // Get history
      const history = await web3Service.getDrugHistory(batchId);

      return {
        ...blockchainData,
        fullComposition: backendData.data?.fullComposition,
        ownershipHistory: history
      };
    } catch (error) {
      console.error('Get complete drug info error:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [blockchainStats, auditStats] = await Promise.all([
        web3Service.getContractStats(),
        api.getAuditStatistics()
      ]);

      return {
        ...blockchainStats,
        ...auditStats
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }
}

const blockchainService = new BlockchainService();
export default blockchainService;
