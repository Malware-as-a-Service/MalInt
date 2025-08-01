import { Result } from "neverthrow";
import { Repository } from "../types";
import {
  FailToParse,
  MissingKey,
  MissingSection,
  WrongKeyType,
} from "../errors";

export interface Format {
  deserializeRepository(
    content: string,
  ): Result<
    Repository,
    FailToParse | MissingSection | MissingKey | WrongKeyType
  >;
}
