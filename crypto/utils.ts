import { ethers, BigNumber } from "ethers";
import { randomBytes, hexlify, hexZeroPad } from "ethers/lib/utils";
import { FIELD_ORDER } from "./hashToField";
import * as fs from 'fs';

export function randHex(n: number): string {
  return hexlify(randomBytes(n));
}

export function to32Hex(n: BigNumber): string {
  return hexZeroPad(n.toHexString(), 32);
}

export function randFs(): BigNumber {
  const r = BigNumber.from(randomBytes(32));
  return r.mod(FIELD_ORDER);
}

export function append(newVariables: Record<string, string>, envFilePath: string) {
  try {
      const existingEnvFileContent = fs.readFileSync(envFilePath, 'utf-8');

      // Parse the existing content into a key-value object
      const existingEnvVariables = existingEnvFileContent
          .split('\n')
          .reduce((env, line) => {
              const [key, value] = line.split('=');
              if (key && value) {
                  env[key] = value;
              }
              return env;
      }, {} as Record<string, string>);
      
      // Merge the existing and new environment variables
      const mergedEnvVariables = { ...existingEnvVariables, ...newVariables };

      // Create the updated .env file content
      const updatedEnvFileContent = Object.entries(mergedEnvVariables)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');

      // Write the updated content back to the .env file
      fs.writeFileSync(envFilePath, updatedEnvFileContent);
  } catch (error) {
      console.error('Error reading/writing .env file:', error);
  }
}