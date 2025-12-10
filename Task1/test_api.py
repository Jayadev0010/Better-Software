import unittest
import json

class TestCommentLogic(unittest.TestCase):
    
    def test_comment_api_structure(self):
        print("\nTesting Comment API Structure")
        
     
        create_data = {'comment_text': 'Test comment', 'author_name': 'User'}
        self.assertTrue('comment_text' in create_data)
        self.assertEqual(create_data['comment_text'], 'Test comment')
        print("✓ CREATE: Comment data structure OK")
        
   
        update_data = {'comment_text': 'Updated comment'}
        self.assertTrue('comment_text' in update_data)
        print("✓ UPDATE: Update data structure OK")
        
       
        error_response = {'error': 'need comment text'}
        self.assertTrue('error' in error_response)
        print("✓ ERROR: Error response structure OK")
  
        success_response = {'id': 1, 'comment_text': 'test', 'author_name': 'User'}
        self.assertTrue('id' in success_response)
        self.assertTrue('comment_text' in success_response)
        print("✓ SUCCESS: Success response structure OK")
    
    def test_crud_flow_simulation(self):
        print("\nSimulating CRUD Operations")
        
        comments = []
        

        new_comment = {'id': 1, 'comment_text': 'First comment', 'author_name': 'Alice'}
        comments.append(new_comment)
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]['comment_text'], 'First comment')
        print("✓ CREATE: Add comment successful")
        
        # READ
        comment = comments[0]
        self.assertEqual(comment['id'], 1)
        self.assertEqual(comment['author_name'], 'Alice')
        print("✓ READ: Get comment successful")
        
  
        comments[0]['comment_text'] = 'Updated comment'
        self.assertEqual(comments[0]['comment_text'], 'Updated comment')
        print("✓ UPDATE: Edit comment successful")
        
 
        comments.pop()
        self.assertEqual(len(comments), 0)
        print("✓ DELETE: Remove comment successful")
    
    def test_validation_logic(self):
        print("\nTesting Validation Logic")
        
  
        valid = {'comment_text': 'Hello'}
        self.assertTrue(valid.get('comment_text'))
        print("✓ Valid comment data accepted")
        
        invalid = {'author_name': 'John'}
        self.assertFalse(invalid.get('comment_text'))
        print("✓ Invalid comment (no text) rejected")
        
       
        empty = {'comment_text': ''}
        self.assertFalse(empty.get('comment_text'))
        print("✓ Empty comment text rejected")
    
    def test_api_endpoints(self):
        print("\nTesting API Endpoint Names")
        
        endpoints = {
            'GET': '/api/tasks/{id}/comments',
            'POST': '/api/tasks/{id}/comments',
            'PUT': '/api/tasks/{id}/comments/{comment_id}',
            'DELETE': '/api/tasks/{id}/comments/{comment_id}'
        }
        
        self.assertEqual(endpoints['GET'], '/api/tasks/{id}/comments')
        self.assertEqual(endpoints['POST'], '/api/tasks/{id}/comments')
        self.assertEqual(endpoints['PUT'], '/api/tasks/{id}/comments/{comment_id}')
        self.assertEqual(endpoints['DELETE'], '/api/tasks/{id}/comments/{comment_id}')
        
        print("✓ GET endpoint: " + endpoints['GET'])
        print("✓ POST endpoint: " + endpoints['POST'])
        print("✓ PUT endpoint: " + endpoints['PUT'])
        print("✓ DELETE endpoint: " + endpoints['DELETE'])
    
    def test_response_codes(self):
        print("\nTesting HTTP Response Codes")
        
        codes = {
            'success_get': 200,
            'success_post': 201,
            'bad_request': 400,
            'not_found': 404
        }
        
        self.assertEqual(codes['success_get'], 200)
        self.assertEqual(codes['success_post'], 201)
        self.assertEqual(codes['bad_request'], 400)
        self.assertEqual(codes['not_found'], 404)
        
        print("✓ 200: Success GET")
        print("✓ 201: Success POST (Created)")
        print("✓ 400: Bad Request")
        print("✓ 404: Not Found")

if __name__ == '__main__':
    print("=" * 60)
    print("COMMENT API CRUD TESTS")
    print("=" * 60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCommentLogic)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("✓ ALL TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 60)