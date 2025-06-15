import { render, screen, fireEvent, act } from "@testing-library/react";
import PromptWorkbench from "../PromptWorkbench";
import { DryRunProvider } from "../../dryrun/DryRunProvider";

jest.useFakeTimers();

describe("PromptWorkbench", () => {
  it("enables Enhance button after analysis", () => {
    render(
      <DryRunProvider>
        <PromptWorkbench />
      </DryRunProvider>,
    );

    const button = screen.getByRole("button", { name: /enhance/i });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/describe your goal/i), {
      target: { value: "Translate this text to French." },
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(button).not.toBeDisabled();
  });
});
