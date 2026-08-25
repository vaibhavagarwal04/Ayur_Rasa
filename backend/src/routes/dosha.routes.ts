import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

router.post('/predict', async (req: Request, res: Response) => {
  try {
    const pythonScript = path.resolve(
      __dirname,
      '../../../ml_model/predict.py'
    );

    const pythonProcess = spawn('python', [pythonScript]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python prediction error:', errorOutput);

        return res.status(500).json({
          success: false,
          message: 'ML prediction failed',
          error: errorOutput
        });
      }

      try {
        const result = JSON.parse(output);

        if (!result.success) {
          return res.status(400).json(result);
        }

        return res.status(200).json(result);
      } catch (error) {
        console.error('Invalid Python output:', output);

        return res.status(500).json({
          success: false,
          message: 'Invalid response from ML model',
          output
        });
      }
    });

    pythonProcess.stdin.write(JSON.stringify(req.body));
    pythonProcess.stdin.end();

  } catch (error) {
    console.error('Dosha prediction error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to predict dosha'
    });
  }
});

export default router;