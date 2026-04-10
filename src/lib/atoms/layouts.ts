// 5种排版结构 — T1-T5

export interface LayoutTemplate {
  id: string
  name: string
  params: {
    fontSizeBody: string
    fontSizeH1: string
    fontSizeH2: string
    fontSizeH3: string
    lineHeight: string
    paragraphSpacing: string
    headingTopSpacing: string
    contentPadding: string
    blockquoteBorder: string
    blockquotePadding: string
    listItemSpacing: string
    textIndent?: string
    // T3 卡片模块型
    cardBorderRadius?: string
    cardPadding?: string
    cardMargin?: string
    cardShadow?: string
    cardBorder?: string
    // T4 杂志编辑型
    firstParagraphSize?: string
    blockquoteFontSize?: string
    blockquoteTextAlign?: string
    blockquoteFontStyle?: string
    // T5 对话访谈型
    questionFontWeight?: string
    answerIndent?: string
    speakerLabelSize?: string
  }
  tags: string[]
}

export const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'T1', name: '紧凑知识型',
    params: {
      fontSizeBody: '15px',
      fontSizeH1: '22px',
      fontSizeH2: '18px',
      fontSizeH3: '16px',
      lineHeight: '1.75',
      paragraphSpacing: '16px',
      headingTopSpacing: '24px',
      contentPadding: '16px 20px',
      blockquoteBorder: '3px',
      blockquotePadding: '12px 16px',
      listItemSpacing: '8px',
    },
    tags: ['knowledge', 'dense', 'professional'],
  },
  {
    id: 'T2', name: '舒展阅读型',
    params: {
      fontSizeBody: '16px',
      fontSizeH1: '24px',
      fontSizeH2: '20px',
      fontSizeH3: '17px',
      lineHeight: '2.0',
      paragraphSpacing: '24px',
      headingTopSpacing: '40px',
      contentPadding: '20px 24px',
      blockquoteBorder: '2px',
      blockquotePadding: '16px 20px',
      listItemSpacing: '12px',
      textIndent: '2em',
    },
    tags: ['prose', 'relaxed', 'reading'],
  },
  {
    id: 'T3', name: '卡片模块型',
    params: {
      fontSizeBody: '15px',
      fontSizeH1: '22px',
      fontSizeH2: '18px',
      fontSizeH3: '16px',
      lineHeight: '1.8',
      paragraphSpacing: '16px',
      headingTopSpacing: '24px',
      contentPadding: '20px',
      blockquoteBorder: '0',
      blockquotePadding: '16px 20px',
      listItemSpacing: '10px',
      cardBorderRadius: '8px',
      cardPadding: '20px',
      cardMargin: '20px 0',
      cardShadow: '0 2px 8px rgba(0,0,0,0.06)',
      cardBorder: '1px solid rgba(0,0,0,0.08)',
    },
    tags: ['card', 'modular', 'structured'],
  },
  {
    id: 'T4', name: '杂志编辑型',
    params: {
      fontSizeBody: '16px',
      fontSizeH1: '28px',
      fontSizeH2: '22px',
      fontSizeH3: '18px',
      lineHeight: '1.9',
      paragraphSpacing: '20px',
      headingTopSpacing: '48px',
      contentPadding: '20px 24px',
      blockquoteBorder: '0',
      blockquotePadding: '20px 24px',
      listItemSpacing: '10px',
      firstParagraphSize: '18px',
      blockquoteFontSize: '20px',
      blockquoteTextAlign: 'center',
      blockquoteFontStyle: 'italic',
    },
    tags: ['magazine', 'editorial', 'premium'],
  },
  {
    id: 'T5', name: '对话访谈型',
    params: {
      fontSizeBody: '15px',
      fontSizeH1: '22px',
      fontSizeH2: '18px',
      fontSizeH3: '16px',
      lineHeight: '1.8',
      paragraphSpacing: '16px',
      headingTopSpacing: '24px',
      contentPadding: '16px 20px',
      blockquoteBorder: '0',
      blockquotePadding: '12px 16px',
      listItemSpacing: '10px',
      questionFontWeight: 'bold',
      answerIndent: '16px',
      speakerLabelSize: '13px',
    },
    tags: ['dialogue', 'interview', 'qa'],
  },
]
