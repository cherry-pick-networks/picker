//
// Build diagnosis input text from request: response_text or item stem+option.
//

import type { DiagnoseRequest } from './diagnoseSchema.ts';
import { getItem } from '#api/search/services/bankService.ts';

export type GetResponseTextFail = {
  ok: false;
  status: 400 | 404 | 502;
  message: string;
};

export function buildTextFromItem(
  stem: string | undefined,
  options: string[] | undefined,
  selectedOptionIndex: number,
): string {
  const stemPart =
    typeof stem === 'string' && stem.length > 0 ? stem : '';
  const opt = Array.isArray(options) &&
      options[selectedOptionIndex] != null
    ? options[selectedOptionIndex]
    : '';
  return [stemPart, opt].filter(Boolean).join(
    '\n\nSelected: ',
  );
}

async function getTextFromItem(
  itemId: string,
  selectedOptionIndex: number,
): Promise<{ text: string } | GetResponseTextFail> {
  const item = await getItem(itemId);
  if (item == null) {
    return {
      ok: false,
      status: 404,
      message: 'Item not found',
    };
  }
  const text = buildTextFromItem(
    item.stem,
    item.options,
    selectedOptionIndex,
  );
  return text.length === 0
    ? {
      ok: false,
      status: 400,
      message: 'Item has no stem/option text',
    }
    : { text };
}

export async function getResponseText(
  req: DiagnoseRequest,
): Promise<{ text: string } | GetResponseTextFail> {
  if (
    typeof req.response_text === 'string' &&
    req.response_text.trim().length > 0
  ) {
    return { text: req.response_text.trim() };
  }
  if (
    typeof req.item_id !== 'string' ||
    typeof req.selected_option_index !== 'number'
  ) {
    return {
      ok: false,
      status: 400,
      message:
        'Either response_text or (item_id + selected_option_index)',
    };
  }
  return await getTextFromItem(
    req.item_id,
    req.selected_option_index,
  );
}
