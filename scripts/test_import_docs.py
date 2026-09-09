"""Regression checks for document extraction and provenance boundaries."""
import unittest
from import_docs import canonical, extract

class ImporterTests(unittest.TestCase):
    def test_sections_and_source_links(self):
        html='''<html><nav><a href="/unrelated.html">Ignore navigation</a></nav><div id="main-col-body"><h1>A service</h1><p>A short source introduction.</p><h2 id="security">Security</h2><h3 id="keys">Keys</h3><p><a href="../guide/encryption.html#keys">Encryption</a><a href="https://example.com/">External</a></p></div></html>'''
        doc=extract(html,'https://docs.aws.amazon.com/demo/guide/welcome.html')
        self.assertEqual(doc['title'],'A service')
        self.assertEqual(doc['sections'][0]['url'],'https://docs.aws.amazon.com/demo/guide/welcome.html#security')
        self.assertEqual(len(doc['sections']),2)
        self.assertEqual(len(doc['links']),1)
        self.assertEqual(doc['links'][0]['url'],'https://docs.aws.amazon.com/demo/guide/encryption.html#keys')

    def test_navigation_only_page_is_rejected(self):
        with self.assertRaises(ValueError):
            extract('<html><h1>AWS Documentation</h1><nav>Service guides</nav></html>','https://docs.aws.amazon.com/')

    def test_excerpt_is_bounded(self):
        doc=extract('<div id="main-col-body"><h1>A</h1><p>'+('word '*80)+'</p></div>','https://docs.aws.amazon.com/a.html')
        self.assertEqual(len(doc['excerpt'].split()),24)

    def test_only_canonical_official_sources(self):
        self.assertIsNone(canonical('https://docs.aws.amazon.com.example.com/page'))
        self.assertIsNone(canonical('http://docs.aws.amazon.com/page'))
        self.assertEqual(canonical('https://docs.aws.amazon.com/a.html?q=1#part'),'https://docs.aws.amazon.com/a.html')

if __name__=='__main__':unittest.main()
