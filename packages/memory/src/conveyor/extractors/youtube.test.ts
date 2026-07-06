import { describe, it, expect } from 'vitest';
import { extractYoutube, makeYoutubeExtractor, vttToText, youtubeVideoId, buildYoutubeMarkdown, YOUTUBE_HOSTS, type YoutubeRunner } from './youtube';
import { BlockedHostError, type NetGuardDeps } from '../net-guard';
import { ExtractorEmptyError } from './pdf';

const guard: NetGuardDeps = { allowedHosts: YOUTUBE_HOSTS, resolve: async () => ['142.250.0.1'] };

const META = JSON.stringify({ id: 'abc123', title: 'Great Talk', channel: 'ACME', upload_date: '20260101', duration: 600, description: 'A description line.', chapters: [{ title: 'Intro', start_time: 0 }, { title: 'Core', start_time: 90 }] });
const VTT = 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello <c>everyone</c>\n\n00:00:03.000 --> 00:00:05.000\nHello everyone\n\n00:00:05.000 --> 00:00:07.000\nwelcome to the talk';

const runner = (over: Partial<{ metadataJson: string; vtt: string | null }> = {}): YoutubeRunner => () => ({ metadataJson: META, vtt: VTT, ...over });

describe('youtubeVideoId', () => {
  it('parses watch, youtu.be and shorts forms', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(youtubeVideoId('https://youtu.be/abc123')).toBe('abc123');
    expect(youtubeVideoId('https://www.youtube.com/shorts/abc123')).toBe('abc123');
  });
});

describe('vttToText', () => {
  it('strips timestamps/tags and dedups consecutive repeats', () => {
    expect(vttToText(VTT)).toBe('Hello everyone welcome to the talk');
  });
});

describe('extractYoutube', () => {
  it('composes title + chapters + description + transcript markdown, untrusted, youtube: key', async () => {
    const r = await extractYoutube('https://www.youtube.com/watch?v=abc123', runner(), guard);
    expect(r.markdown).toContain('# Great Talk');
    expect(r.markdown).toContain('## Chapters');
    expect(r.markdown).toContain('## Transcript');
    expect(r.markdown).toContain('welcome to the talk');
    expect(r.source_key).toBe('youtube:abc123');
    expect(r.trust).toBe('untrusted');
  });

  it('still produces a candidate from description alone when there are no subtitles', async () => {
    const r = await extractYoutube('https://youtu.be/abc123', runner({ vtt: null }), guard);
    expect(r.markdown).toContain('## Description');
    expect(r.markdown).not.toContain('## Transcript');
  });

  it('throws ExtractorEmptyError when both transcript and description are empty', async () => {
    const empty = JSON.stringify({ id: 'abc123', title: 'X' });
    await expect(extractYoutube('https://youtu.be/abc123', runner({ metadataJson: empty, vtt: null }), guard)).rejects.toThrow(ExtractorEmptyError);
  });

  it('blocks a non-allowlisted host before spawning the runner', async () => {
    let spawned = false;
    const r: YoutubeRunner = () => { spawned = true; return { metadataJson: META, vtt: VTT }; };
    const blocked: NetGuardDeps = { allowedHosts: [], resolve: async () => ['142.250.0.1'] };
    await expect(extractYoutube('https://www.youtube.com/watch?v=abc123', r, blocked)).rejects.toThrow(BlockedHostError);
    expect(spawned).toBe(false);
  });

  it('makeYoutubeExtractor adapts to the frozen Extractor signature', async () => {
    const ex = makeYoutubeExtractor(runner(), guard);
    const r = await ex('youtube', 'https://youtu.be/abc123');
    expect(r.source_key).toBe('youtube:abc123');
  });
});

describe('buildYoutubeMarkdown', () => {
  it('omits empty sections', () => {
    const md = buildYoutubeMarkdown({ id: 'z', title: 'T' }, '');
    expect(md).toContain('# T');
    expect(md).not.toContain('## Transcript');
    expect(md).not.toContain('## Chapters');
  });
});
