import { type Result, ok, err } from "@/shared/result";
import { validationError, type AppError } from "@/shared/errors";
import type { BugPriority } from "@/domain/value-objects/priority";

export interface BugProps {
  id: string;
  recipeBookId: string;
  affectedProductIds: string[];
  environment: string;
  problemDescription: string;
  expectedBehavior: string;
  observedBehavior: string;
  stepsToReproduce: string;
  evidenceAndContext: string;
  priority: BugPriority;
  createdById: string;
  createdAt: Date;
}

export class Bug {
  private constructor(private readonly props: BugProps) {}

  static create(props: BugProps): Result<Bug, AppError> {
    if (props.affectedProductIds.length === 0) {
      return err(validationError("At least one affected product is required"));
    }
    if (props.environment.trim().length === 0 || props.environment.length > 100) {
      return err(validationError("Environment must be between 1 and 100 characters"));
    }
    if (props.problemDescription.trim().length === 0 || props.problemDescription.length > 5000) {
      return err(validationError("Problem description must be between 1 and 5000 characters"));
    }
    if (props.expectedBehavior.trim().length === 0 || props.expectedBehavior.length > 2000) {
      return err(validationError("Expected behavior must be between 1 and 2000 characters"));
    }
    if (props.observedBehavior.trim().length === 0 || props.observedBehavior.length > 2000) {
      return err(validationError("Observed behavior must be between 1 and 2000 characters"));
    }
    if (props.stepsToReproduce.trim().length === 0 || props.stepsToReproduce.length > 5000) {
      return err(validationError("Steps to reproduce must be between 1 and 5000 characters"));
    }
    if (props.evidenceAndContext.length > 5000) {
      return err(validationError("Evidence and context must be at most 5000 characters"));
    }
    return ok(new Bug(props));
  }

  static reconstitute(props: BugProps): Bug {
    return new Bug(props);
  }

  get id(): string {
    return this.props.id;
  }

  get recipeBookId(): string {
    return this.props.recipeBookId;
  }

  get affectedProductIds(): string[] {
    return this.props.affectedProductIds;
  }

  get environment(): string {
    return this.props.environment;
  }

  get problemDescription(): string {
    return this.props.problemDescription;
  }

  get expectedBehavior(): string {
    return this.props.expectedBehavior;
  }

  get observedBehavior(): string {
    return this.props.observedBehavior;
  }

  get stepsToReproduce(): string {
    return this.props.stepsToReproduce;
  }

  get evidenceAndContext(): string {
    return this.props.evidenceAndContext;
  }

  get priority(): BugPriority {
    return this.props.priority;
  }

  get createdById(): string {
    return this.props.createdById;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
