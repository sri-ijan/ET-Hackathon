import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ComplianceReport } from '../models/ComplianceReport.js';
import { logger } from '../config/logger.js';

const testDatabaseConnection = async () => {
  try {
    logger.info('🧪 Running database integration test...');
    await connectDB();

    logger.info('📊 Checking ComplianceReport collection...');
    const reportCount = await ComplianceReport.countDocuments();
    logger.info(`✅ Successfully connected. Current report count: ${reportCount}`);

    // Create a dummy report to test model constraints
    logger.info('✍️ Writing a dummy compliance test report...');
    const tempReport = await ComplianceReport.create({
      specificationFileName: 'spec_transformer_test.pdf',
      submittalFileName: 'submittal_transformer_test.pdf',
      overallStatus: 'fail',
      summary: 'Test summary for transformer comparison.',
      parameters: [
        {
          parameterName: 'Rated Capacity',
          specificationValue: '2500 kVA',
          submittalValue: '2000 kVA',
          status: 'fail',
          deviationReason: 'Capacity submittal is 2000 kVA, which is lower than the 2500 kVA specification.',
          locationInSpec: 'Section 4.1, Page 6',
          locationInSubmittal: 'Section 2.0, Page 3',
        },
      ],
    });

    logger.info(`✅ Created test report with ID: ${tempReport._id}`);

    // Read it back
    const fetchedReport = await ComplianceReport.findById(tempReport._id);
    logger.info(`📖 Fetched report back. Specification name: ${fetchedReport.specificationFileName}`);

    // Clean up
    await ComplianceReport.deleteOne({ _id: tempReport._id });
    logger.info('🗑️ Cleaned up test report successfully.');

    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB. Test passed! 🎉');
  } catch (error) {
    logger.error(`❌ Test failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

testDatabaseConnection();
