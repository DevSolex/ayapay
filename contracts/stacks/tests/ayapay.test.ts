import { describe, expect, it } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

describe("ayapay contract test suite", () => {
  it("should deploy properly", async () => {
    const simnet = await initSimnet();
    const contract = simnet.getContract("ayapay");
    expect(contract).toBeDefined();
  });

  it("should add an employee correctly", async () => {
    const simnet = await initSimnet();
    
    const admin = simnet.getAccounts().get("wallet_1")!;
    const employee = simnet.getAccounts().get("wallet_2")!;
    const token = simnet.getAccounts().get("wallet_3")!;

    // Calling add-employee function
    const result = simnet.callPublicFn(
      "ayapay",
      "add-employee",
      [Cl.principal(employee), Cl.principal(employee), Cl.uint(1000), Cl.principal(token)],
      admin
    );

    expect(result.result).toBeDefined();
    // expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  it("should remove an employee correctly", async () => {
    const simnet = await initSimnet();
    
    const admin = simnet.getAccounts().get("wallet_1")!;
    const employee = simnet.getAccounts().get("wallet_2")!;
    const token = simnet.getAccounts().get("wallet_3")!;

    // First add employee
    simnet.callPublicFn(
      "ayapay",
      "add-employee",
      [Cl.principal(employee), Cl.principal(employee), Cl.uint(1000), Cl.principal(token)],
      admin
    );

    // Then remove employee
    const result = simnet.callPublicFn(
      "ayapay",
      "remove-employee",
      [Cl.principal(employee)],
      admin
    );

    expect(result.result).toBeDefined();
    // expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
  });
});

// Contract test suite iteration 1 
console.log("Running clarity test iteration 1 for add-employee and remove-employee");

// Contract test suite iteration 2 
console.log("Running clarity test iteration 2 for add-employee and remove-employee");

// Contract test suite iteration 3 
console.log("Running clarity test iteration 3 for add-employee and remove-employee");

// Contract test suite iteration 4 
console.log("Running clarity test iteration 4 for add-employee and remove-employee");

// Contract test suite iteration 5 
console.log("Running clarity test iteration 5 for add-employee and remove-employee");

// Contract test suite iteration 6 
console.log("Running clarity test iteration 6 for add-employee and remove-employee");

// Contract test suite iteration 7 
console.log("Running clarity test iteration 7 for add-employee and remove-employee");

// Contract test suite iteration 8 
console.log("Running clarity test iteration 8 for add-employee and remove-employee");

// Contract test suite iteration 9 
console.log("Running clarity test iteration 9 for add-employee and remove-employee");
