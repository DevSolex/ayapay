import { describe, expect, it } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

describe("ayapay contract test suite", () => {
  it("should deploy properly and not be paused initially", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    const result = simnet.callReadOnlyFn(
      "ayapay",
      "is-contract-paused",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.bool(false));
  });

  it("should allow admin to update admin", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const newAdmin = accounts.get("wallet_1")!;

    const result = simnet.callPublicFn(
      "ayapay",
      "update-admin",
      [Cl.principal(newAdmin)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    const adminCheck = simnet.callReadOnlyFn(
      "ayapay",
      "get-admin",
      [],
      deployer
    );
    expect(adminCheck.result).toEqual(Cl.principal(newAdmin));
  });

  it("should allow admin to pause and resume contract", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;

    let result = simnet.callPublicFn("ayapay", "pause-contract", [], deployer);
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    let status = simnet.callReadOnlyFn("ayapay", "is-contract-paused", [], deployer);
    expect(status.result).toEqual(Cl.bool(true));

    result = simnet.callPublicFn("ayapay", "resume-contract", [], deployer);
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  it("should prevent adding employee when paused", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const employee = accounts.get("wallet_1")!;

    simnet.callPublicFn("ayapay", "pause-contract", [], deployer);

    const result = simnet.callPublicFn(
      "ayapay",
      "add-employee",
      [Cl.principal(employee), Cl.principal(employee), Cl.uint(1000), Cl.principal(deployer)],
      deployer
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(105))); // err-paused
  });

  it("should update employee correctly", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const employee = accounts.get("wallet_1")!;
    const token = accounts.get("wallet_2")!;

    // Add first
    simnet.callPublicFn(
      "ayapay",
      "add-employee",
      [Cl.principal(employee), Cl.principal(employee), Cl.uint(1000), Cl.principal(token)],
      deployer
    );

    // Update
    const result = simnet.callPublicFn(
      "ayapay",
      "update-employee",
      [Cl.principal(employee), Cl.principal(employee), Cl.uint(2000), Cl.principal(token)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    // Verify
    const verify = simnet.callReadOnlyFn(
      "ayapay",
      "get-employee",
      [Cl.principal(employee)],
      deployer
    );
    expect(verify.result).toEqual(
      Cl.some(
        Cl.tuple({
          active: Cl.bool(true),
          salary: Cl.uint(2000),
          token: Cl.principal(token),
          wallet: Cl.principal(employee)
        })
      )
    );
  });

  it("should pay employees in batch STX", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const emp1 = accounts.get("wallet_1")!;
    const emp2 = accounts.get("wallet_2")!;

    simnet.callPublicFn("ayapay", "add-employee", [Cl.principal(emp1), Cl.principal(emp1), Cl.uint(1000), Cl.principal(deployer)], deployer);
    simnet.callPublicFn("ayapay", "add-employee", [Cl.principal(emp2), Cl.principal(emp2), Cl.uint(2000), Cl.principal(deployer)], deployer);

    const payments = Cl.list([
      Cl.tuple({ "employee-id": Cl.principal(emp1), amount: Cl.uint(1000) }),
      Cl.tuple({ "employee-id": Cl.principal(emp2), amount: Cl.uint(2000) })
    ]);

    const result = simnet.callPublicFn("ayapay", "pay-employees-batch-stx", [payments], deployer);
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
  });

  it("should allow emergency withdraw of STX", async () => {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn("ayapay", "emergency-withdraw-stx", [Cl.uint(0)], deployer);
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
  });
});
