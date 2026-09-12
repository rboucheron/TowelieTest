import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";
import type { TestCasePriority } from "@/domain/value-objects/priority";

export interface TestCaseProps {
  id: string;
  recipeBookId: string;
  description: string;
  platform: string;
  steps: string;
  expectedResult: string;
  priority: TestCasePriority;
  createdAt: Date;
}

export class TestCase {
  private constructor(private readonly props: TestCaseProps) {}

  static create(props: TestCaseProps): Result<TestCase, AppError> {
    if (props.description.trim().length === 0 || props.description.length > 2000) {
      return err(validationError("Test case description must be between 1 and 2000 characters"));
    }
    if (props.platform.trim().length === 0 || props.platform.length > 100) {
      return err(validationError("Platform must be between 1 and 100 characters"));
    }
    if (props.steps.trim().length === 0 || props.steps.length > 5000) {
      return err(validationError("Steps must be between 1 and 5000 characters"));
    }
    if (props.expectedResult.trim().length === 0 || props.expectedResult.length > 2000) {
      return err(validationError("Expected result must be between 1 and 2000 characters"));
    }
    return ok(new TestCase(props));
  }

  static reconstitute(props: TestCaseProps): TestCase {
    return new TestCase(props);
  }

  get id(): string {
    return this.props.id;
  }

  get recipeBookId(): string {
    return this.props.recipeBookId;
  }

  get description(): string {
    return this.props.description;
  }

  get platform(): string {
    return this.props.platform;
  }

  get steps(): string {
    return this.props.steps;
  }

  get expectedResult(): string {
    return this.props.expectedResult;
  }

  get priority(): TestCasePriority {
    return this.props.priority;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
