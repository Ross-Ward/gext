// Test 2: Code Change
export class TestUtility {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public greet(): string {
    return `Hello, ${this.name}!`;
  }
}