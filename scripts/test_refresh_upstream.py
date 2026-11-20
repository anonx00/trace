import unittest
from refresh_upstream import selected, changes

class UpstreamTests(unittest.TestCase):
    def test_scope(self):
        self.assertTrue(selected('sigma', 'rules/cloud/aws/cloudtrail/a.yml'))
        self.assertTrue(selected('sigma', 'rules-emerging-threats/cloud/aws/a.yml'))
        self.assertFalse(selected('sigma', 'rules/cloud/azure/a.yml'))
        self.assertFalse(selected('sigma', 'tests/aws/a.yml'))
        self.assertTrue(selected('hacktricks', 'src/pentesting-cloud/aws-security/nested/page.md'))
        self.assertFalse(selected('hacktricks', 'src/pentesting-cloud/gcp-security/page.md'))

    def test_added_modified_deleted_and_unchanged(self):
        previous = [{'path': p, 'blob': h} for p,h in [('old','1'),('changed','2'),('same','3')]]
        current = [{'path': p, 'blob': h} for p,h in [('new','4'),('changed','5'),('same','3')]]
        self.assertEqual(changes(previous,current), {'added':['new'], 'modified':['changed'], 'removed':['old']})

if __name__ == '__main__':
    unittest.main()
